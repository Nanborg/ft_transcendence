FROM debian:12

RUN apt update && apt install make g++ -y

COPY game_engine /game_engine

RUN make -C game_engine

EXPOSE 8888/udp

CMD ["/game_engine/gameEngine"]