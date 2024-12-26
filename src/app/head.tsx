export default function Head() {
  return (
    <>
      <title>Festival Rave Gear</title>
      <meta content="width=device-width, initial-scale=1" name="viewport" />
      <meta name="description" content="Festival and rave clothing and accessories" />
      <link rel="icon" href="/favicon.ico" type="image/x-icon" />
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      
      {/* Preload critical resources */}
      <link
        rel="preload"
        href="/images/frgheader2.0.webp"
        as="image"
        type="image/webp"
      />
      
      {/* Preconnect to external domains */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Load fonts */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
    </>
  )
}
