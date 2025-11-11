'use client'

export default function GoogleMap() {
  return (
    <div className="w-full max-w-[700px] aspect-[4/3] mx-auto overflow-hidden">
      <iframe
        src="https://www.google.com/maps/d/u/0/embed?mid=13URlGmR22II1U94zpHq3k5TmnR0nWIo&ehbc=2E312F&noprof=1"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        frameBorder="0"
        title="Google Map"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  )
}
