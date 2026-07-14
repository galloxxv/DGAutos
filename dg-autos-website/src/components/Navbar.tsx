function Navbar() {
    return (
        <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/30 backdrop-blur-xl transition-all duration-300">
            <div className="flex items-center justify-between px-6 py-4">
                <div>
<h1 className="text-3xl font-black tracking-widest text-white">
DG <span className="text-red-600">AUTOS</span>
</h1>

<p className="text-xs uppercase tracking-[0.3em] text-gray-400">
Body • Paint • Mechanical
</p>
</div>

                <nav className="hidden md:flex gap-8 text-white">
                    <a href="#home" className="hover:text-red-500">Home</a>
                    <a href="#services" className="hover:text-red-500">Services</a>
                    <a href="#gallery" className="hover:text-red-500">Gallery</a>
                    <a href="#about" className="hover:text-red-500">About</a>
                    <a href="#contact" className="hover:text-red-500">Contact</a>
                </nav>

                <a href="#contact"
                className="rounded-lg bg-red-600 px-5 py-2 font-semibold transition hover:bg-red-700"
                >
                    Free Estimate
                </a>
            </div>
        </header> 
    )
}

export default Navbar;