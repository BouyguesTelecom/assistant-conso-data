# Template for linking your Bouygues Telecom account to your Google Assistant

## This template uses

- An actions-on-google action consisting in a dialogflow conversation
- A dialogflow fulfillment environment.

## Steps for reproducing the account linking

1. [Create an Actions on Google project.](#actions_on_google_project)
2. [Create a Dialogflow project.](#dialogflow_project)

## <a name="actions_on_google_project"></a> Create an Actions on Google project

1. Go to the [Actions console.](https://console.actions.google.com/)
2. Click New project.
3. Enter a name for your project.
4. Select "Custom" and click "Next".
5. Scroll down to the bottom of the page and click "Click here to build your Action using DialogFlow".
6. In the upper menu, click Develop. Then, click Account linking in the left navigation.
7. Enable Account Linking
8. Select "No, I only want to allow account on my website"
9. For the Linking Type, select "OAuth" and "Authorization" for the grant type.
10. Request a Client ID and Client secret via Bouygues Telecom Open API portal : https://developer.bouyguestelecom.fr/
11. Authorization URL: https://oauth2.bouyguestelecom.fr/authorize
12. Token URL: https://oauth2.bouyguestelecom.fr/token
13. In the upper menu, click Develop. Then, click Actions in the left navigation.
14. Select "Custom action" and click "Build". You will be redirected to the [Dialogflow console.](https://dialogflow.cloud.google.com/)

## <a name="dialogflow_project"></a> Create a Dialogflow project

1. Go to the [Dialogflow console.](https://dialogflow.cloud.google.com/)
2. Enter a name for your project and click "Create".
3. In the left menu, click "Fullfillment". Then, enable "Inline Editor" or "Webhook".
4. Use the code provided in the index.js and package.json files provided in this repository.
5. _Optionally, you can use your preferred code and all the extra functionalities provided by [Dialogflow-fullfillment.](https://dialogflow.com/docs/fulfillment)_

## Account linking

![](img/account_creation_section.PNG?raw=true)
![](img/linking_type_section.PNG?raw=true)
![](img/client_information_section.PNG?raw=true)

## Testing a Dialogflow agent on Android

1. On your phone, open [Google Assistant app.](https://play.google.com/store/apps/details?id=com.google.android.apps.googleassistant)
2. Say "Talk with name_of_your_agent" to start chatting with your bot.
![](img/assistant_1.png?raw=true)
3. Launch your intent and now you can link Bouygues Telecom with Google Assistant.
![](img/assistant_2.png?raw=true)
## Additional informations
- [OAuth linking flows](https://developers.google.com/assistant/identity/oauth-concept-guide)
- [Testing best practices](https://developers.google.com/assistant/conversational/df-asdk/dialogflow/testing-best-practices)
