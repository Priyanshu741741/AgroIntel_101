import os
import argparse
import subprocess
import sys

def check_prerequisites():
    """Check if all prerequisites are installed"""
    # Check if Python is installed
    try:
        python_version = sys.version_info
        print(f"Python version: {python_version.major}.{python_version.minor}.{python_version.micro}")
    except:
        print("Error: Python is not installed or not in PATH")
        return False
    
    # Check if Node.js is installed
    try:
        node_version = subprocess.check_output(["node", "--version"]).decode().strip()
        print(f"Node.js version: {node_version}")
    except:
        print("Error: Node.js is not installed or not in PATH")
        return False
    
    # Check if npm is installed
    try:
        npm_version = subprocess.check_output(["npm", "--version"]).decode().strip()
        print(f"npm version: {npm_version}")
    except:
        print("Error: npm is not installed or not in PATH")
        return False
    
    return True

def setup_backend():
    """Set up the backend"""
    print("\n--- Setting up backend ---")
    
    # Create virtual environment if it doesn't exist
    if not os.path.exists("venv"):
        print("Creating virtual environment...")
        subprocess.run([sys.executable, "-m", "venv", "venv"])
    
    # Activate virtual environment and install requirements
    if os.name == "nt":  # Windows
        activate_cmd = ".\\venv\\Scripts\\activate"
        pip_cmd = ".\\venv\\Scripts\\pip"
    else:  # macOS/Linux
        activate_cmd = "source ./venv/bin/activate"
        pip_cmd = "./venv/bin/pip"
    
    print("Installing backend dependencies...")
    if os.name == "nt":  # Windows
        subprocess.run(f"{pip_cmd} install -r requirements.txt", shell=True)
    else:  # macOS/Linux
        subprocess.run(f"bash -c '{activate_cmd} && pip install -r requirements.txt'", shell=True)
    
    print("Backend setup complete!")

def setup_frontend():
    """Set up the frontend"""
    print("\n--- Setting up frontend ---")
    
    # Check if frontend directory exists
    if not os.path.exists("../frontend"):
        print("Error: frontend directory not found")
        return False
    
    # Install frontend dependencies
    os.chdir("../frontend")
    print("Installing frontend dependencies...")
    subprocess.run(["npm", "install"])
    
    # Return to backend directory
    os.chdir("../backend")
    print("Frontend setup complete!")
    return True

def run_application(mode):
    """Run the application"""
    if mode == "backend" or mode == "both":
        print("\n--- Starting backend server ---")
        backend_process = subprocess.Popen([
            sys.executable, "app.py"
        ])
    else:
        backend_process = None
    
    if mode == "frontend" or mode == "both":
        print("\n--- Starting frontend server ---")
        os.chdir("../frontend")
        frontend_process = subprocess.Popen(["npm", "start"])
        os.chdir("../backend")
    else:
        frontend_process = None
    
    try:
        # Keep the script running
        if backend_process:
            backend_process.wait()
        elif frontend_process:
            frontend_process.wait()
    except KeyboardInterrupt:
        print("\nStopping servers...")
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()

def main():
    parser = argparse.ArgumentParser(description="Run the Crop Monitoring Application")
    parser.add_argument("--setup", action="store_true", help="Set up the application")
    parser.add_argument("--mode", choices=["backend", "frontend", "both"], default="both",
                        help="Which part of the application to run")
    
    args = parser.parse_args()
    
    if args.setup:
        if not check_prerequisites():
            print("Error: Prerequisites check failed")
            return
        
        setup_backend()
        setup_frontend()
    
    run_application(args.mode)

if __name__ == "__main__":
    main()