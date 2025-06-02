use crate::db::DB;
use axum::Router;
use axum::extract::State;
use axum::extract::connect_info::ConnectInfo;
use axum::routing::any;
use axum::{
    body::Bytes,
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    response::IntoResponse,
};
use axum_extra::TypedHeader;
use futures_util::{sink::SinkExt, stream::StreamExt};
use std::net::SocketAddr;
use std::ops::ControlFlow;

pub fn router() -> Router {
    let db = DB::new();

    Router::new().route("/", any(ws_handler)).with_state(db)
}

#[allow(clippy::unused_async)]
async fn ws_handler(
    ws: WebSocketUpgrade,
    user_agent: Option<TypedHeader<headers::UserAgent>>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    State(db): State<DB>,
) -> impl IntoResponse {
    let user_agent = if let Some(TypedHeader(user_agent)) = user_agent {
        user_agent.to_string()
    } else {
        String::from("Unknown browser")
    };
    println!("`{user_agent}` at {addr} connected.");

    ws.on_upgrade(move |socket| handle_socket(socket, addr, db))
}

async fn handle_socket(mut socket: WebSocket, who: SocketAddr, db: DB) {
    socket
        .send(Message::Binary(Bytes::from(db.value())))
        .await
        .unwrap();

    let (mut sender, mut receiver) = socket.split();

    let mut recv_task = tokio::spawn(async move {
        let mut cnt = 0;

        while let Some(Ok(msg)) = receiver.next().await {
            db.update(&msg.clone().into_data());

            sender
                .send(Message::Binary(Bytes::from(db.value())))
                .await
                .unwrap();

            cnt += 1;

            if process_message(msg, who).is_break() {
                break;
            }
        }
        cnt
    });

    tokio::select! {
        rv_b = (&mut recv_task) => {
            match rv_b {
                Ok(b) => println!("Received {b} messages"),
                Err(b) => println!("Error receiving messages {b:?}")
            }

        }
    }

    println!("Websocket context {who} destroyed");
}

fn process_message(msg: Message, who: SocketAddr) -> ControlFlow<(), ()> {
    match msg {
        Message::Text(t) => {
            println!(">>> {who} sent str: {t:?}");
        }
        Message::Binary(d) => {
            println!(">>> {who} sent {} bytes: {d:?}", d.len());
        }
        Message::Close(c) => {
            if let Some(cf) = c {
                println!(
                    ">>> {who} sent close with code {} and reason `{}`",
                    cf.code, cf.reason
                );
            } else {
                println!(">>> {who} somehow sent close message without CloseFrame");
            }
            return ControlFlow::Break(());
        }
        Message::Pong(v) => {
            println!(">>> {who} sent pong with {v:?}");
        }
        Message::Ping(v) => {
            println!(">>> {who} sent ping with {v:?}");
        }
    }
    ControlFlow::Continue(())
}
