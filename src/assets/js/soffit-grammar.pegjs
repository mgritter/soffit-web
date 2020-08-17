// Soffit grammar for graphs
// Permits newlines, unlike the normal Soffit which is embedded in JSON
// and only allows semicolons.

Graph = Separator first:(Edge/Node) rest:GraphElement* Separator? {
 return [first].concat( rest )
}

GraphElement = Separator elem:(Edge/Node) { return elem; }

Separator = [ ;\n\r\t]*

Edge = src:Identifier dst:Target+ Space tag:Tag? {
  return { "type" : "edge", "src" : src, "dests" : dst, "tag" : tag }
}
  
Arrow = "->" / "--" / "<-"

Target = Space arrow:Arrow Space node:Identifier {
  return { "direction" : arrow, "node" : node } }
  
Node = 
  id:Identifier merges:MergeSpec*
  Space
  tag:Tag? { return { "type" : "node", "id" : id, "tag" : tag, "merge" : merges } }

MergeSpec = "^" node:Identifier { return node }

Space = [ \t]*

Tag = "[" tag:[^\]]* "]" { return tag.join("") }

Identifier = chars:IdentChar+ { return chars.join( "" ); }

HeadChar = [\u0041-\u005A\u005F\u00A8\u00AA\u00AD\u00AF\u2054] /
          [\u0061-\u007A\u00B2-\u00B5\u00B7-\u00BA] /
          [\u00BC-\u00BE\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF] /
          [\u0100-\u02FF\u0370-\u167F\u1681-\u180D\u180F-\u1DBF] /
          [\u1E00-\u1FFF\u200B-\u200D\u202A-\u202D\u203F-\u2040] /
          [\u2060-\u206F\u2070-\u20CF\u2100-\u218F\u2460-\u24FF] /
          [\u2776-\u2793\u2C00-\u2DFF\u2E80-\u2FFF\u3004-\u3007] /
          [\u3021-\u302F\u3031-\u303F\u3040-\uD7FF\uF900-\uFD3D] /
          [\uFD40-\uFDCF\uFDF0-\uFE1F\uFE30-\uFE44\uFE47-\uFFFD]

IdentChar = HeadChar /
        [\u0030-\u0039\u0300-\u036f\u1cd0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]

