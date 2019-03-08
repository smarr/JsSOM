#!/usr/bin/env python
import yaml
with open('jsTestDriver.conf', 'r') as f:
    files = yaml.load(f)['load']
    print(' '.join(files))
