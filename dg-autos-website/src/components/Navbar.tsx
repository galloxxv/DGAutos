function Navbar() {
    return (
        <header className="fixed top-0 left-0 w-full bg-black/80 backdrop-blur-md border-b border-gray-800 z-50">
            <div className="flex items-center justify-between px-6 py-4">
                <h1 className="text-3xl font-extrabold text-red-600">DG AUTOS</h1>

                <nav className="hidden md:flex gap-8 text-white">
                    <a href="#" className="hover:text-red-500">Home</a>
                    <a href="#" className="hover:text-red-500">Services</a>
                    <a href="#" className="hover:text-red-500">Gallery</a>
                    <a href="#" className="hover:text-red-500">About</a>
                    <a href="#" className="hover:text-red-500">Contact</a>
                </nav>

                <button className="bg-red-600 px-5 py-2 rounded-lg hover:bg-red-700 transition">
                    Free Estimate
                </button>
            </div>
        </header>
    )
}

export default Navbar;