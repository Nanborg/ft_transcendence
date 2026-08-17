FROM debian:12 AS builder

RUN apt-get update && apt-get install -y \
    make \
    g++

COPY src /

RUN make clean
RUN make all

# TODO(nanborg): Add an env-configured runtime command (port/log level) and
#validate behavior outside local mode.

CMD ["/gameEngineRuntime"]
