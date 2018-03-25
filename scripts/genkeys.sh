#!/bin/bash

ALGORITHM=brainpoolP512t1
# openssl ecparam -list_curves # to get a list of supported curves

PRIV_FILE=ec_key.pem
PUB_FILE=ec_pub.pem

openssl ecparam -out $PRIV_FILE -name $ALGORITHM -genkey
openssl ec -in $PRIV_FILE -pubout -out $PUB_FILE

