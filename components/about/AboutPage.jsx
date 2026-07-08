import AboutReveal from '@/components/about/AboutReveal';

const whyChooseUs = [
  {
    title: 'Premium Craftsmanship',
    description: 'Every piece is finished with care, designed to look elegant and feel special.',
  },
  {
    title: 'Affordable Luxury',
    description: 'Beautiful jewellery that brings a refined look without the premium price tag.',
  },
  {
    title: 'Secure Shopping',
    description: 'Safe payments and protected checkout, so you can shop with complete confidence.',
  },
  {
    title: 'Fast Delivery',
    description: 'Orders are packed with care and shipped promptly to your doorstep.',
  },
  {
    title: 'Trusted Quality',
    description: 'Consistent finishes and thoughtful design across every collection we offer.',
  },
  {
    title: 'Customer Satisfaction',
    description: 'Dedicated support to help you find the perfect piece for every occasion.',
  },
];

function SectionDivider() {
  return <div className="mx-auto h-px w-16 bg-gray-200" aria-hidden="true" />;
}

export default function AboutPage({ displayClassName = '', bodyClassName = '' }) {
  return (
    <div className={`bg-white text-gray-950 ${bodyClassName}`}>
      {/* Hero */}
      <section className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <AboutReveal>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              About Kayra Aura
            </p>
            <h1
              className={`${displayClassName} mt-6 text-5xl font-bold tracking-wide text-gray-950 md:text-6xl`}
            >
              Timeless Beauty, Crafted for Every Woman
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
              Kayra Aura celebrates the art of elegant fashion jewellery — refined designs that
              elevate everyday style and make every occasion feel unforgettable.
            </p>
          </AboutReveal>
        </div>
      </section>

      <SectionDivider />

      {/* Our Story */}
      <section className="bg-gray-50 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <AboutReveal delay={80}>
            <h2
              className={`${displayClassName} text-2xl font-semibold text-gray-950 md:text-3xl`}
            >
              Our Story
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-gray-600 md:text-lg">
              <p>
                Kayra Aura began with a simple belief: every woman deserves jewellery that feels
                beautiful, confident, and effortlessly elegant — without compromise.
              </p>
              <p>
                What started as a passion for timeless design has grown into a curated collection of
                fashion jewellery crafted for weddings, celebrations, and the moments in between. We
                blend contemporary style with classic refinement, creating pieces that complement
                your individuality.
              </p>
              <p>
                Our vision is to make premium-looking jewellery accessible to every woman who
                values quality, grace, and the quiet confidence that comes from wearing something
                truly special.
              </p>
            </div>
          </AboutReveal>
        </div>
      </section>

      <SectionDivider />

      {/* Our Mission */}
      <section className="px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl text-center">
          <AboutReveal delay={80}>
            <h2
              className={`${displayClassName} text-2xl font-semibold text-gray-950 md:text-3xl`}
            >
              Our Mission
            </h2>
            <div className="mt-6 space-y-5 text-base leading-8 text-gray-600 md:text-lg">
              <p>
                We are committed to delivering beautiful, affordable jewellery with excellent
                quality — pieces that look luxurious, feel comfortable, and stand the test of time.
              </p>
              <p>
                From selecting materials to final finishing, every detail is considered so you
                receive jewellery that exceeds expectations. We believe elegance should be within
                reach, and every order should reflect the care we put into our craft.
              </p>
            </div>
          </AboutReveal>
        </div>
      </section>

      <SectionDivider />

      {/* Why Choose Us */}
      <section className="bg-gray-50 px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <AboutReveal delay={80}>
            <h2
              className={`${displayClassName} text-center text-2xl font-semibold text-gray-950 md:text-3xl`}
            >
              Why Choose Us
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-8 text-gray-600 md:text-lg">
              Thoughtfully designed jewellery, backed by a shopping experience you can trust.
            </p>
          </AboutReveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-4">
            {whyChooseUs.map((item, index) => (
              <AboutReveal key={item.title} delay={120 + index * 60}>
                <div className="group rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-md sm:p-7">
                  <h3 className={`${displayClassName} text-lg font-semibold text-gray-950 md:text-xl`}>
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-8 text-gray-600">{item.description}</p>
                </div>
              </AboutReveal>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* Our Promise */}
      <section className="px-4 py-14 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <AboutReveal delay={80}>
            <h2
              className={`${displayClassName} text-center text-2xl font-semibold text-gray-950 md:text-3xl`}
            >
              Our Promise
            </h2>
            <blockquote className="mt-8 rounded-2xl bg-gray-50 px-8 py-10 text-center shadow-sm sm:px-12 sm:py-12">
              <p
                className={`${displayClassName} text-xl leading-relaxed text-gray-700 md:text-2xl md:leading-relaxed`}
              >
                &ldquo;Every piece we create is designed to make you feel confident, elegant, and
                beautiful.&rdquo;
              </p>
            </blockquote>
          </AboutReveal>
        </div>
      </section>

      <SectionDivider />

      {/* Closing */}
      <section className="bg-gray-50 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <AboutReveal delay={80}>
            <h2
              className={`${displayClassName} text-3xl font-bold tracking-wide text-gray-950 md:text-4xl`}
            >
              Thank You for Being Part of Our Journey
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
              We&apos;re honored to be a part of your special moments and look forward to bringing
              timeless elegance to your collection.
            </p>
          </AboutReveal>
        </div>
      </section>
    </div>
  );
}
