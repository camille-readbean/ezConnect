#!/bin/bash
sleep 2
cd /usr/src/app/ezConnect
flask db upgrade
flask run