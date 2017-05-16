# Connected FT
A 20% time project to explore connecting unique devices to FT user accounts.

## Rationale

Engaged customers are more valuable to the FT than customers that come and go. As such, much of our thinking revolves around 'How can we make the FT engaging enough to keep people coming back'. To this end, we try to surface content that we think each individual user will find most valuable at the times we think they're most likely to consume it. 

This is a good approach, but I think that we could enhance this offering by enabling customers to feed their own habit. 'Connected FT' enables two things:

- A user can identify their individual devices to the FT (in a non-permanant way) and tie them to their account.
- Users can send FT content seemlessly from any FT.com offering to any device of their choosing.

This functionality is enabled through the Web Push APIs.

Typically, push notifications are used by services to alert users of something that has happened while they were away from said service. This functionality, once exposed to the use, can also be used to allow individuals to send content to themselves to best suit their immediate or near-future needs.

## Building

1. Clone this repo.
2. `cd` into the directory
3. `npm install`
4. `npm run start`

A server with the app to register individual devices will now be running at port 4567. This can be changed by adding a `.env` file to the project directory with `PORT=[DESIRED_PORT_NUMBER]` as an entry.