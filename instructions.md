# OpenHamClock

## Documentation

- [OpenHamClock User Manual](https://github.com/accius/openhamclock/blob/main/docs/MANUAL.md) — every panel, layout and feature, including DX cluster, propagation, satellites and WSJT-X.
- [N1MM Logger+ Setup](https://github.com/accius/openhamclock/blob/main/docs/N1MM-SETUP.md) — how to point N1MM Logger+ at OpenHamClock.

## What you get on StartOS

- **Web Interface**: the OpenHamClock dashboard, protected by a password. Your browser asks for it once and remembers it, so a wall screen or tablet stays signed in.
- **WSJT-X UDP** and **N1MM / DXLog UDP**: ports that logging software on your network sends decodes and logged contacts to, so they show up on the map.
- Your layout, panels and filters are stored on the server. Every screen that opens the dashboard shows the same setup, and it is included in your backups.

## Getting set up

1. Run **Set Password**. Copy the password and keep it somewhere safe. The username is always `admin`.
2. Run **Station Settings** and enter your callsign and grid square. Pick your units, 12- or 24-hour clock and time zone.
3. Start the service, open the **Web Interface**, and sign in with `admin` and your password.

## Using OpenHamClock

### Web interface

The dashboard opens on your station's position, with space weather, band conditions, spots and maps already running. Use the dashboard's own **Settings** to change the layout, theme and panels. These are shared by every screen.

Anyone who has the password can view the dashboard and change its settings. Share it only with people you want to have that access.

### Actions

- **Set Password** (or **Reset Password** once one exists): creates a new password for the dashboard. The old one stops working right away, so every screen asks again.
- **Station Settings**: your callsign, grid square, units, clock and time zone. Your callsign is also used to log in to DX cluster servers. Saving restarts OpenHamClock.
- **Online Accounts**: optional logins. QRZ.com or HamQTH give fuller callsign lookups. A Space-Track account adds a source of satellite orbit data. Leave both fields of an account empty to stop using it. Saving restarts OpenHamClock.

### Sending data from WSJT-X and N1MM

These ports listen for software on your local network.

- **WSJT-X or JTDX**: in **Settings → Reporting**, set **UDP Server** to your server's LAN address and **UDP Server port number** to `2237`.
- **N1MM Logger+ or DXLog**: broadcast contacts to your server's LAN address on port `12060`. See the N1MM setup guide above.

Each of these interfaces shows two ports. Only the first one is used.

### Privacy when published through a tunnel

OpenHamClock fetches its data itself from many public services: NOAA, PSKReporter, the Reverse Beacon Network, DX clusters, POTA, satellite and weather sources. Those services see your server's address. If you publish the dashboard through a tunnel to keep your home IP private, send the service's outbound traffic through that tunnel too. If you use a tunnel for another reason, there is nothing to change.
