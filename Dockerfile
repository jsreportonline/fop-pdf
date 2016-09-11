FROM ubuntu:latest
MAINTAINER Jan Blaha
EXPOSE 5000

RUN apt-get update && apt-get install -y sudo
RUN apt-get install -y  curl
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN apt-get install -y nodejs default-jre

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN wget apache.miloslavbrada.cz/xmlgraphics/fop/binaries/fop-2.1-bin.zip -O fop.zip
RUN unzip fop.zip
RUN rm fop.zip
RUN chmod +x fop-2.1/fop
RUN export PATH=$PATH:fop-2.1

COPY package.json /usr/src/app/
RUN npm install

COPY . /usr/src/app

EXPOSE 5000
CMD [ "node", "index.js" ]