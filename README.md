# OmniRules
Omni Rules is a Javascript Rules engine

### Why OmniRules?

#### Design Philosophy
We wanted to have a competent rules engine that 
- would save on development cost
- be versatile
- write once & run everywhere
- be declarative
- support versions
- execute efficient
- be immutable
- traceable
- have a BDD/TDD development approach

The idea is, the moment you learn a new fact about some business context, an
immediate decision needs to be made. That means the rules engine is re-entrant
and only makes decision or runs rules, once their facts/inputs are known.



### What is OmniRules?
`Omni`, because it needs to runs everywhere. OmniRules is written in vanilla 
javascript, so it can run client-side, server-side, in NodeJS, in the web browser, 
Java, Swift, .Net and Python via embedded JavaScript engines. If your language
supports Javascript, you can run OmniRules.

`Rules`, because the code should be expressed as simple rules. A rule is only 
ever fired off if it's value is undetermined, but it's inputs are known. This
is like fact-based or event-driven execution. 

If you learn that your passport expires in less than 6 months from now, you should
make a decision to renew it. But if you don't know the expiry date, you can't 
decide if you should renew it.


### How OmniRules work
Let's take the example mentioned above. Let's say the date is 2019-07-01

*Passport*:
```$json
{
    expiryDate: '2019-12-01'
}
```

And we have a rule called `Renew Passport`:
```$xslt
new Date().toJSON() > 
```