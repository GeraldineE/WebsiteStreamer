
FROM debian:jessie

RUN apt-get update

# basics
RUN sudo apt install -y python2.7 python-pip
