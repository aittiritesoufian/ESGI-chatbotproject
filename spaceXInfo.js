module.exports = function(){
    this.getInfoSpaceX = function(data, choice, option = null){
        switch(choice){
            case "next":
                var value = {
                    "type": "message",
                    "text": "Numéro de lancement : "+data.flight_number+" Mission: "+data.mission_name,
                    "attachments": [
                        {
                        "contentType": "application/vnd.microsoft.card.adaptive",
                        "content": {
                            "type": "AdaptiveCard",
                            "version": "1.0",
                            "body": [
                            {
                                "type": "TextBlock",
                                "text": (data.details ? data.details : "< pas d'information >"),
                                "size": "large"
                            },
                            {
                                "type": "TextBlock",
                                "text": "Date de lancement : "+(data.launch_date_local ? data.launch_date_local : "< pas d'information >")
                            },
                            {
                                "type": "TextBlock",
                                "text": "Site de lancement : "+(data.launch_site.site_name_long ? data.launch_site.site_name_long : "< pas d'information >"),
                                "separation": "none"
                            }
                            ],
                            "actions": [
                            {
                                "type": "Action.OpenUrl",
                                "url": (data.links.article_link ? data.links.article_link : "< pas d'information >"),
                                "title": "Learn More"
                            }
                            ]
                        }
                        }
                    ]
                }
                break;
            case "latest":
                var value = {
                    "type": "message",
                    "text": "",
                    "attachmentLayout": "carousel",
                    "attachments": [
                        {
                          "contentType": "application/vnd.microsoft.card.adaptive",
                          "content": {
                            "type": "AdaptiveCard",
                            "version": "1.0",
                            "body": [
                                {
                                    "type": "Container",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "text": "",
                                            "weight": "bolder",
                                            "size": "medium"
                                        },
                                        {
                                            "type": "ColumnSet",
                                            "columns": [
                                                {
                                                    "type": "Column",
                                                    "width": "auto",
                                                    "items": [
                                                        {
                                                            "type": "Image",
                                                            "url": data.links.mission_patch_small,
                                                            "size": "large",
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "Column",
                                                    "width": "stretch",
                                                    "items": [
                                                        {
                                                            "type": "TextBlock",
                                                            "text": "Numéro de lancement : "+data.flight_number,
                                                            "weight": "bolder",
                                                            "wrap": true
                                                        },
                                                        {
                                                            "type": "TextBlock",
                                                            "text": "Mission: "+data.mission_name,
                                                            "wrap": true
                                                        },
                                                        {
                                                            "type": "TextBlock",
                                                            "text": "Année de lancement: "+data.launch_year,
                                                            "wrap": true
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    "type": "Container",
                                    "items": [
                                        {
                                            "type": "TextBlock",
                                            "text": data.details,
                                            "wrap": true
                                        },
                                        {
                                            "type": "TextBlock",
                                            "text": "Launch "+(data.launch_success ? "Succes" : "Fail"),
                                            "color": data.launch_success ? "good" : "attention",
                                            "wrap": true
                                        },
                                        {
                                            "type": "FactSet",
                                            "facts": [
                                                {
                                                    "title": "Date de lancement : ",
                                                    "value": data.launch_date_local
                                                },
                                                {
                                                    "title": "Site de lancement : ",
                                                    "value": data.launch_site.site_name_long
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ],
                            "actions": [
                              {
                                "type": "Action.ShowCard",
                                "title": "Rocket Information",
                                "card": {
                                    "type": "AdaptiveCard",
                                    "body": [
                                        {
                                            "type": "Container",
                                            "items": [
                                                {
                                                    "type": "FactSet",
                                                    "facts": [
                                                        {
                                                            "title": "Rocket name :",
                                                            "value": data.rocket.rocket_type+"/"+data.rocket.rocket_name
                                                        },
                                                        {
                                                            "title": "Core Serial :",
                                                            "value": data.rocket.first_stage.cores[0].core_serial
                                                        },
                                                        {
                                                            "title": "Nombre de vols :",
                                                            "value": data.rocket.first_stage.cores[0].flight
                                                        },
                                                        {
                                                            "title": "Blocks :",
                                                            "value": data.rocket.first_stage.cores[0].block
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                              },
                              {
                                "type": "Action.ShowCard",
                                "title": "Payloads",
                                "card": {
                                    "type": "AdaptiveCard",
                                    "body": [
                                        {
                                            "type": "Container",
                                            "items": [
                                                {
                                                    "type": "FactSet",
                                                    "facts": [
                                                        {
                                                            "title": "Payloads ID :",
                                                            "value": data.rocket.second_stage.payloads[0].payload_id
                                                        },
                                                        {
                                                            "title": "CAP Serial :",
                                                            "value": data.rocket.second_stage.payloads[0].cap_serial
                                                        },
                                                        {
                                                            "title": "Customer :",
                                                            "value": data.rocket.second_stage.payloads[0].customers[0]
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                              },
                              {
                                "type": "Action.ShowCard",
                                "title": "Reuse",
                                "card": {
                                    "type": "AdaptiveCard",
                                    "body": [
                                        {
                                            "type": "Container",
                                            "items": [
                                                {
                                                    "type": "FactSet",
                                                    "facts": [
                                                        {
                                                            "title": "Core :",
                                                            "value": data.reuse.core ? "Yes" : "No"
                                                        },
                                                        {
                                                            "title": "Side Core 1 :",
                                                            "value": data.reuse.side_core1 ? "Yes" : "No"
                                                        },
                                                        {
                                                            "title": "Side Core 2 :",
                                                            "value": data.reuse.side_core2 ? "Yes" : "No"
                                                        },
                                                        {
                                                            "title": "Fairings :",
                                                            "value": data.reuse.fairings ? "Yes" : "No"
                                                        },
                                                        {
                                                            "title": "Capsule :",
                                                            "value": data.reuse.capsule ? "Yes" : "No"
                                                        },
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                              },
                              {
                                "type": "Action.OpenUrl",
                                "url": data.links.video_link,
                                "title": "Launch cast"
                              }
                            ]
                          }
                        }
                      ]
                    
                }
            break;
            case "carousel":
                var value =  {
                    "type": "message",
                    "text": "Numéro de lancement : "+data.flight_number,
                    "attachmentLayout": "carousel",
                    "attachments": option
                    
                };
            break;
        }
    
        return value;
    }

    this.carrouselCard = function(item){
        var value = {
            "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                  "type": "AdaptiveCard",
                  "version": "1.0",
                  "body": [
                      {
                          "type": "Container",
                          "items": [
                              {
                                  "type": "TextBlock",
                                  "text": "",
                                  "weight": "bolder",
                                  "size": "medium"
                              },
                              {
                                  "type": "ColumnSet",
                                  "columns": [
                                      {
                                          "type": "Column",
                                          "width": "auto",
                                          "items": [
                                              {
                                                  "type": "Image",
                                                  "url": (item.links.mission_patch_small ? item.links.mission_patch_small : ""),
                                                  "size": "large",
                                              }
                                          ]
                                      },
                                      {
                                          "type": "Column",
                                          "width": "stretch",
                                          "items": [
                                              {
                                                  "type": "TextBlock",
                                                  "text": "Numéro de lancement : "+(item.flight_number ? item.flight_number : "(pas d'informations)"),
                                                  "weight": "bolder",
                                                  "wrap": true
                                              },
                                              {
                                                  "type": "TextBlock",
                                                  "text": "Mission: "+(item.mission_name ? item.mission_name : "(pas d'informations)"),
                                                  "wrap": true
                                              },
                                              {
                                                  "type": "TextBlock",
                                                  "text": "Année de lancement: "+(item.launch_year ? item.launch_year : "(pas d'informations)"),
                                                  "wrap": true
                                              }
                                          ]
                                      }
                                  ]
                              }
                          ]
                      },
                      {
                          "type": "Container",
                          "items": [
                              {
                                  "type": "TextBlock",
                                  "text": (item.details ? item.details : "(pas d'informations)"),
                                  "wrap": true
                              },
                              {
                                  "type": "FactSet",
                                  "facts": [
                                      {
                                          "title": "Date de lancement : ",
                                          "value": (item.launch_date_local ? item.launch_date_local : "(pas d'informations)")
                                      },
                                      {
                                          "title": "Site de lancement : ",
                                          "value": (item.launch_site.site_name_long ? item.launch_site.site_name_long : "(pas d'informations)")
                                      }
                                  ]
                              }
                          ]
                      }
                  ],
                  "actions": [
                      {
                      "type": "Action.OpenUrl",
                      "url": (item.links.article_link ? item.links.article_link : "(pas d'informations)"),
                      "title": "Learn More"
                    }
                  ]
                }
            };

        return value;
    }
}