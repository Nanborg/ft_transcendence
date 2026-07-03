FROM debian:12

RUN apt update && apt install make g++ -y

COPY src /

RUN make all clean

# TODO(nanborg): Add an env-configured runtime command (port/log level) and
#validate behavior outside local mode.
CMD ["/gameEngineRuntime"]