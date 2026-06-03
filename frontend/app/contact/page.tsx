import Container from "@/components/ui/Container";

export const metadata = {
  title: "Contact Us - fastLain",
  description: "Get in touch with fastLain for any inquiries or support.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-24">
      <Container>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-secondary tracking-tight">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Have a question about our premium collection or need help with your order? Our team is here to assist you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
            {/* Contact Form */}
            <div className="bg-white p-8 md:p-12 rounded-[2rem] shadow-xl shadow-secondary/5 border border-stone-100">
              <h3 className="text-2xl font-bold text-secondary mb-6">Send us a Message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-xs font-bold uppercase tracking-widest text-gray-500">First Name</label>
                    <input type="text" id="firstName" className="w-full bg-accent/20 border-transparent focus:border-primary focus:ring-primary rounded-xl px-4 py-3 outline-none transition-all" placeholder="John" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-xs font-bold uppercase tracking-widest text-gray-500">Last Name</label>
                    <input type="text" id="lastName" className="w-full bg-accent/20 border-transparent focus:border-primary focus:ring-primary rounded-xl px-4 py-3 outline-none transition-all" placeholder="Doe" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-gray-500">Email Address</label>
                  <input type="email" id="email" className="w-full bg-accent/20 border-transparent focus:border-primary focus:ring-primary rounded-xl px-4 py-3 outline-none transition-all" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="subject" className="text-xs font-bold uppercase tracking-widest text-gray-500">Subject</label>
                  <input type="text" id="subject" className="w-full bg-accent/20 border-transparent focus:border-primary focus:ring-primary rounded-xl px-4 py-3 outline-none transition-all" placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-gray-500">Message</label>
                  <textarea id="message" rows={5} className="w-full bg-accent/20 border-transparent focus:border-primary focus:ring-primary rounded-xl px-4 py-3 outline-none transition-all resize-none" placeholder="Write your message here..."></textarea>
                </div>
                <button type="button" className="w-full bg-primary hover:bg-secondary text-white font-bold uppercase tracking-widest text-sm py-4 rounded-xl transition-all shadow-lg shadow-primary/30">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Info & Map */}
            <div className="space-y-12 lg:pt-8">
              <div className="space-y-8">
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 bg-accent/30 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-secondary mb-1">Our Store</h4>
                    <p className="text-gray-500 leading-relaxed">
                      123 Fashion Avenue, <br />
                      Gulshan 1, Dhaka 1212, <br />
                      Bangladesh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 bg-accent/30 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-secondary mb-1">Email Us</h4>
                    <p className="text-gray-500 leading-relaxed">
                      support@fastlain.com <br />
                      info@fastlain.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 bg-accent/30 text-primary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-secondary mb-1">Call Us</h4>
                    <p className="text-gray-500 leading-relaxed">
                      +880 123 456 7890 <br />
                      Mon-Fri, 9am to 6pm
                    </p>
                  </div>
                </div>
              </div>

              {/* Placeholder Map */}
              <div className="w-full h-64 bg-gray-200 rounded-[2rem] overflow-hidden relative border-4 border-white shadow-lg">
                <div className="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1m3!1d14604.93608139556!2d90.40723825000001!3d23.77467615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7715a40c603%3A0xec01cd75f33139f5!2sGulshan%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
