import { C } from '@masala/parser';

const startUML = C.string('@startuml')
const endUML = C.string('@enduml')

export const umlParser = startUML.drop()
  .then(endUML.drop());