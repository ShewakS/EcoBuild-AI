"""
Test if xgboost is importable inside a multiprocessing spawn child,
exactly as uvicorn --reload does it.
"""
import multiprocessing
import sys

def worker():
    try:
        import xgboost
        print(f"[SPAWN] xgboost OK: {xgboost.__version__}", flush=True)
    except ModuleNotFoundError as e:
        print(f"[SPAWN] FAILED: {e}", flush=True)
    try:
        import aiofiles
        print(f"[SPAWN] aiofiles OK", flush=True)
    except ModuleNotFoundError as e:
        print(f"[SPAWN] aiofiles FAILED: {e}", flush=True)
    print(f"[SPAWN] sys.path = {sys.path}", flush=True)

if __name__ == "__main__":
    multiprocessing.set_start_method("spawn", force=True)
    p = multiprocessing.Process(target=worker)
    p.start()
    p.join()
    print("Done.")
