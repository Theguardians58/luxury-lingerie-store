// This is the master frame for your entire website.
// Everything you create will appear inside this layout.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <nav>This is the Navigation Bar</nav>
        <main>
          {children}
        </main>
        <footer>This is the Footer</footer>
      </body>
    </html>
  );
}
