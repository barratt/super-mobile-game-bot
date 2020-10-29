#!/bin/bash

adb shell input keyevent 26 #Pressing the lock button
adb shell input touchscreen swipe 930 880 930 380 #Swipe UP
adb shell input text 74286 # Enter pin
adb shell input keyevent 66 # OK

