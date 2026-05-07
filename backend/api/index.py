import sys
import os

# Add the backend root to Python path so `main`, `models`, etc. are importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
