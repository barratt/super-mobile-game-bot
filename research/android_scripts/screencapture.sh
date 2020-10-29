#!/bin/bash
# adb shell screenrecord --output-format=h264 - | ffplay -

adb shell screenrecord --output-format=h264 - | ffplay -framerate 60 -probesize 32 -sync video  -