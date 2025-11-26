import os
import sys
import base64
from pixellab.client import PixelLabClient
from pixellab.get_balance import get_balance

def generate_pixel_art(prompt: str, output_filename: str, width: int = 128, height: int = 128):
    PIXELLAB_API_KEY = os.getenv("PIXELLAB_API_KEY", "018310b5-d6d1-4cc3-a432-a18feba8a0b4")
    pxl = PixelLabClient(secret=PIXELLAB_API_KEY)

    try:
        response = pxl.generate_image_pixflux(description=prompt, image_size={"width": width, "height": height}, no_background=True)
        image_bytes = base64.b64decode(response.image.base64)

        with open(output_filename, "wb") as f:
            f.write(image_bytes)
        print(f"Generated image saved to {output_filename}")
        return output_filename
    except Exception as e:
        print(f"Error generating image: {e}")
        return None

def check_pixellab_balance():
    PIXELLAB_API_KEY = os.getenv("PIXELLAB_API_KEY", "018310b5-d6d1-4cc3-a432-a18feba8a0b4")
    pxl = PixelLabClient(secret=PIXELLAB_API_KEY)
    try:
        balance_response = get_balance(client=pxl)
        print(f"Your Pixellab balance: ${balance_response.usd:.2f}")
    except Exception as e:
        print(f"Error checking balance: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "balance":
        check_pixellab_balance()
    elif len(sys.argv) < 3:
        print("Usage: python generate_image.py <prompt> <output_filename> [width] [height]")
        print("Or: python generate_image.py balance")
        sys.exit(1)
    else:
        prompt = sys.argv[1]
        output_filename = sys.argv[2]
        width = int(sys.argv[3]) if len(sys.argv) > 3 else 128
        height = int(sys.argv[4]) if len(sys.argv) > 4 else 128
        generate_pixel_art(prompt, output_filename, width, height)