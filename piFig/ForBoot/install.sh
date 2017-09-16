#!/bin/bash


echo "\nInstalling node:"

sudo apt-get install --no-install-recommends xserver-xorg xinit xserver-xorg-video-fbdev xserver-xorg-video-fbturbo libxss1 libgconf-2-4 libnss3 git nodejs libgtk2.0-0 libxtst6

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

echo "\nClone the application"

git clone https://github.com/heidgera/midiSynth.git

cd midiSynth

echo "\nInit the submodules:"

git submodule init

git submodule update

echo "\nInstalling dependencies for application:"

npm i

echo "\nConfiguring"

cd piFig

sudo node installPi.js
