#!/bin/bash
# adb shell screenrecord --output-format=h264 - | ffplay -

adb shell screenrecord --output-format=h264 - | ffplay -framerate 2 -sync video  -