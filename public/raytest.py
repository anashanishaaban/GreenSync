import ray

ray.init(address="auto")  # Connects to running Ray cluster

@ray.remote
def square_number(x):
    return x * x

# Distribute tasks across available CPU cores
futures = [square_number.remote(i) for i in range(10)]
results = ray.get(futures)

print("Ray Distributed Results:", results)