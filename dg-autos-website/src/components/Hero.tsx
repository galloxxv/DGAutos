function Hero() {
  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden bg-[#080808] px-6 pt-24 text-white">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right, rgba(220,38,38,0.25), transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.9))]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        <div className="max-w-4xl">
          <p className="mb-5 font-semibold uppercase tracking-[0.3em] text-red-500">
            Houston, Texas
          </p>

          <h1 className="mb-6 text-5xl font-black uppercase leading-tight md:text-7xl lg:text-8xl">
            Collision
            <br />
            Paint. Mechanical.
          </h1>

          <p className="mb-10 max-w-2xl text-lg leading-8 text-gray-300 md:text-xl">
            Professional auto body, paint, collision, and mechanical repair
            services with honest pricing and quality workmanship.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href="#contact"
              className="rounded-lg bg-red-600 px-8 py-4 text-center text-lg font-bold transition hover:bg-red-700"
            >
              Get Free Estimate
            </a>
            <a
              href="tel:832203236"
              className="rounded-lg border border-white px-8 py-4 text-center text-lg font-bold transition hover:bg-white hover:text-black"
            >
              Call (832) 203-2136
            </a>
          </div>

          <div className="mt-14 grid max-w-2xl grid-cols-2 gap-6 border-t border-gray-800 pt-8 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-black text-red-500">Free</p>
              <p className="text-sm text-gray-400">Estimates</p>
            </div>
            <div>
              <p className="text-2xl font-black text-red-500">Body</p>
              <p className="text-sm text-gray-400">Repair & Paint</p>
            </div>
            <div>
              <p className="text-2xl font-black text-red-500">Full</p>
              <p className="text-sm text-gray-400">Local Shop</p>
            </div>
            <div>
              <p className="text-2xl font-black text-red-500">Trusted</p>
              <p className="text-sm text-gray-400">Service</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-gray-500">
        <p className="text-xs uppercase tracking-[0.25em]">Scroll</p>
        <p className="mt-1 text-xl">v</p>
      </div>
    </section>
  );
}

export default Hero;
