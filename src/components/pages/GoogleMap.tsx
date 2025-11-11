'use client'

export default function GoogleMap() {
  return (
    <div className="overflow-hidden">
      {/* Responsive iframe container with 4:3 aspect ratio (640:480) */}
      <div className="w-full aspect-[4/3]">
        <iframe
          src="https://www.google.com/maps/d/u/0/embed?mid=13URlGmR22II1U94zpHq3k5TmnR0nWIo&ehbc=2E312F&noprof=1"
          width="80%"
          height="80%"
          style={{ border: 0 }}
          frameBorder="0"
          title="Google Map"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  )
}
