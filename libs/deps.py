#!/usr/bin/env python
import yaml
with file('jsTestDriver.conf', 'r') as f:
    files = yaml.load(f)['load']
    print ' '.join(files)
