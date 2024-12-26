import time
from functools import wraps
from typing import Optional, Callable
import threading

class RateLimiter:
    def __init__(self, calls_per_minute: int = 20):
        self.calls_per_minute = calls_per_minute
        self.interval = 60.0 / calls_per_minute  # Time between calls in seconds
        self.last_call_time = 0
        self.lock = threading.Lock()

    def wait(self):
        """Wait until enough time has passed since the last call"""
        with self.lock:
            current_time = time.time()
            time_since_last_call = current_time - self.last_call_time
            
            if time_since_last_call < self.interval:
                sleep_time = self.interval - time_since_last_call
                time.sleep(sleep_time)
            
            self.last_call_time = time.time()

def rate_limited(limiter: Optional[RateLimiter] = None) -> Callable:
    """Decorator to rate limit function calls"""
    if limiter is None:
        limiter = RateLimiter()

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            limiter.wait()
            return func(*args, **kwargs)
        return wrapper
    return decorator
