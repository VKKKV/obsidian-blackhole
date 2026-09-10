"""Compatibility entry point: the production text lens no longer captures DOM.

Legacy DOM capture and shader sampling remain covered independently by
capture_smoke.py and webgl_smoke.py. Run the live backdrop integration instead.
"""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).with_name('backdrop_smoke.py')), run_name='__main__')
