import Button from "./Button";

function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-[linear-gradient(rgba(0,0,0,0.72),rgba(0,0,0,0.9)),url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2000&q=85')] bg-cover bg-center px-6 pt-24 text-white"
    >
      {/* Background effects */}
      

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
           <Button href="#contact">
            Get Free Estimate

            <Button href="tel:8322032136" variant="secondary">
            Call (832) 203-2136
            </Button>
           </Button>
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
