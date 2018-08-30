
FROM debian:jessie

RUN apt-get update

# basics
RUN apt-get install -y python2.7 python-pip
