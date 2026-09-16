from pathlib import Path
from PIL import Image
import wave, math, array

root = Path(__file__).resolve().parents[1]
for name in ["lake", "stars", "mountains"]:
    im = Image.open(root / ".research" / f"{name}.jpg")
    im.save(root / "public/gallery" / f"{name}.webp", quality=84)
    print(name, im.size)
(root / "public/audio").mkdir(exist_ok=True)
rate, duration = 22050, 48
for name, frequencies in [("moonlit-current", [130.81, 164.81, 196, 261.63]), ("quiet-orbit", [146.83, 174.61, 220, 293.66])]:
    samples = array.array("h")
    for i in range(rate * duration):
        t = i / rate
        fade = min(1, t / 4, (duration-t) / 6)
        value = sum(math.sin(2*math.pi*f*t + .3*math.sin(t*.17)) * (.6 + .4*math.sin(t*.3+k)) for k, f in enumerate(frequencies)) / len(frequencies)
        value += .12*math.sin(2*math.pi*frequencies[2]*2*t)*max(0, math.sin(t*.42))**8
        samples.append(int(value * fade * 5500))
    with wave.open(str(root / "public/audio" / f"{name}.wav"), "wb") as output:
        output.setparams((1, 2, rate, 0, "NONE", "not compressed"))
        output.writeframes(samples.tobytes())
