import webview

def main():
    # Create a webview window that loads your website
    window = webview.create_window("My App", "http://localhost:3000", width=800, height=600)
    webview.start()

if __name__ == '__main__':
    main()
