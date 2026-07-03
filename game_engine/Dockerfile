FROM debian:12

RUN apt update && apt install make g++ -y

COPY src /

RUN make all clean

CMD ["/gameEngineRuntime"]