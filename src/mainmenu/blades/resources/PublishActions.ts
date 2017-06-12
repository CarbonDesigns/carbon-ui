import { Response, IValidatePageNameModel, IPublishPageModel, IValidatePageNameResult } from "carbon-api";

export type PublishAction =
    {type: "Publish_NameValidation", response: Response<IValidatePageNameModel, IValidatePageNameResult>} |
    {type: "Publish_Published", response: Response<IPublishPageModel, void>};