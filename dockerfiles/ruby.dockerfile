
FROM debian:jessie

RUN apt-get update

# basics
RUN apt-get install -y ruby