# 🌿 **greensync: decentralized ai for a greener future** 🌎  

> **bringing ai computation to your devices while saving the planet!**  

---

## 🌟 **inspiration**  

ai is amazing, but its environmental impact? **not so much.** 😟💨  
millions use ai daily, relying on energy-hungry **data centers** that consume vast amounts of electricity.  

we asked ourselves:  
✦ *what if ai models could run on a **decentralized network** instead?*  
✦ *what if users were **rewarded** for contributing computing power?*  
✦ *what if ai usage could be **eco-friendly** and still powerful?*  

thus, **greensync** was born—an ai system that distributes computation across multiple devices, reducing reliance on the cloud while giving users **green coins** for their contributions. 💰♻️  

---

## 💡 **what it does**  

✦ **decentralized ai compute** – instead of using centralized servers, greensync **splits ai workloads** across users’ devices.  
✦ **green coins** – earn rewards based on your device’s contribution to ai processing. 🏅  
✦ **real-time impact tracking** – see your **carbon savings** and track your contribution to a sustainable ai ecosystem. 🌍  

> *your laptop or desktop can now be part of a global ai network—**without** relying on cloud servers!* 🚀  

---

## 🛠 **how we built it**  

✦ **backend:** fastapi 🏗️ handles user authentication, api endpoints, and credit calculations.  
✦ **distributed computing:** ray ⚡ efficiently distributes ai tasks across connected devices.  
✦ **frontend:** react + tailwindcss 🎨 provides a sleek, real-time user experience.  
✦ **llm processing:** ollama 🧠 runs ai models locally without needing cloud gpus.  
✦ **data sync:** firebase 🔥 keeps track of green coins, user data, and system metrics.  

> *instead of traditional ai cloud models, we use a dynamic resource-sharing system that **distributes ai tasks** among connected devices. no expensive cloud needed!* 💻🌱  

---

## ⚡ **challenges we faced**  

✦ running computation **in the browser** was difficult due to security and performance constraints.  
✦ **balancing ai workloads** across devices while preventing overload was tricky.  
✦ keeping green coin balances **accurate & real-time** across the dashboard and donation pages.  
✦ optimizing **ray’s scheduling algorithms** to maximize efficiency across **different hardware configurations**.  

---

## 🎉 **accomplishments we're proud of**  

✦ **ai runs without the cloud** – successfully distributed ai processing **without** relying on cloud infrastructure. 🌍  
✦ **green coin system** – a **real-time reward system** that fairly distributes credits based on contribution. 💰  
✦ **engaging ui** – built an **interactive, user-friendly dashboard** that tracks earnings & impact. 📊  
✦ **optimized task scheduling** – made ray **super efficient** in splitting workloads across devices. ⚡  

---

## 🤯 **what we learned**  

✦ **decentralized ai is challenging** but possible! browser-based computing has limitations.  
✦ **optimizing computation sharing** is crucial for **performance & fairness**.  
✦ **task scheduling with ray is key** for balancing workloads efficiently.  
✦ **real-time ui updates require careful state management** to keep everything in sync.  

---

## 🚀 **what’s next for greensync?**  

✦ **support for more ai models** – expand compatibility with **bigger and better** ai models.  
✦ **smarter task allocation** – improve **real-time resource distribution** for efficiency.  
✦ **ai compute pools** – allow users to **team up** for even larger ai projects!  
✦ **real-world impact** – convert **green coins** into **carbon offset donations** for sustainability projects. 🌱💚  

---

## 🛠 **tech stack**  

✦ **backend:** fastapi 🚀  
✦ **compute distribution:** ray ⚡  
✦ **llm processing:** ollama 🤖  
✦ **frontend:** react + tailwindcss 🎨  
✦ **data sync & auth:** firebase 🔥  
✦ **programming languages:** python 🐍, javascript ⚡  

---

## 🌍 **try it out!**  

💻 **run the greensync server:**  
```sh
export ray_enable_windows_or_osx_cluster=1
ray start --head --port=6379
uvicorn server:app --host 0.0.0.0 --port=8000
```

🖥️ **connect another device as a worker:**  
```sh
export ray_enable_windows_or_osx_cluster=1
ray start --address=<your_ip>:6379
```

🌐 **run the frontend:**  
```sh
npm install
npm start
```

---

## 🌟 **join the future of decentralized ai!**  

> 🛠️ **contribute to the project!** [fork the repo](#) and help make ai more sustainable!  
> 💚 **support the cause!** spread the word and **help reduce ai’s carbon footprint!** 🌍  

let’s make ai **greener, fairer, and more accessible** together! 🌱🚀  

---

🎨 **designed with love for the planet.** 🌎💚 **greensync - ai that cares.**
