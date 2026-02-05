// assets/js/data.js
// Demo data model (wireframe only)
// NOTE: This must load before pipeline.js

const CRM_DATA = {
  //  CRM_DATA lives here - accounts: [ { id: "acct_nb", name: "Northbound Labs", ... } ]
  accounts: [
    {
      id: "acct_nb",
      name: "Northbound Labs",
      industry: "Engineering",
      am: "Allan",
      score: 82,
      arCount: 3,
      lastTouch: { date: "Jan 08", type: "Call" },
      staleDays: 6,
      opportunities: [
        {
          id: "opp_nb_1",
          name: "NAS Refresh - 480TB",
          stage: "Discovery",
          value: 120000,
          risk: "warm",      // cool | warm | hot
          closingDays: 21,   // use for “Closing Soon”
          lastActivity: "Discovery meeting completed"
        },
        {
          id: "opp_nb_2",
          name: "Backup Expansion",
          stage: "Quote",
          value: 45000,
          risk: "cool",
          closingDays: 35,
          lastActivity: "Quote requested"
        }
      ]
    },

    {
      id: "acct_wf",
      name: "Wakefield Tech",
      industry: "Government",
      am: "Allan",
      score: 74,
      arCount: 1,
      lastTouch: { date: "Jan 03", type: "Email" },
      staleDays: 11,
      opportunities: [
        {
          id: "opp_wf_1",
          name: "Cluster Expansion",
          stage: "Quote",
          value: 140000,
          risk: "warm",
          closingDays: 14,
          lastActivity: "Waiting on technical confirmation"
        }
      ]
    },

    {
      id: "acct_md",
      name: "Mooring Digital",
      industry: "Manufacturing",
      am: "Allan",
      score: 61,
      arCount: 4,
      lastTouch: { date: "Dec 15", type: "Call" },
      staleDays: 24,
      opportunities: [
        {
          id: "opp_md_1",
          name: "Bid: Storage + Support",
          stage: "Discovery",
          value: 220000,
          risk: "hot",
          closingDays: 9,
          lastActivity: "No response after follow-up"
        }
      ]
    }
  ]
};

window.CRM_DATA = CRM_DATA;
