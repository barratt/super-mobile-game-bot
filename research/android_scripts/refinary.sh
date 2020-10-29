#!/bin/bash

#DEVICE=PIXEL2XL
#SCREEN_HEIGHT=1440
#SCREEN_WIDTH=2880

adb shell input tap 850 300
sleep 2s
# adb shell input tap 364 1130 # Grade 2: Crystal
# sleep 2s
# adb shell input tap 1200 1300 # 1 Chest
# sleep 2s
# adb shell input tap 1500 1300 #done
# sleep 2s
adb shell input tap 1100 1130 # Grade 2: Gas
sleep 2s
adb shell input tap 1200 1300 # 1 Chest
sleep 2s
adb shell input tap 1500 1300 #done
sleep 2s
adb shell input tap 1800 1130 # Grade 2: Ore 
sleep 2s
adb shell input tap 1200 1300 # 1 Chest
sleep 2s
adb shell input tap 1500 1300 #done
sleep 2s
adb shell input tap 100, 75 #back

# TODO: Replace sleep2s with wait for image.