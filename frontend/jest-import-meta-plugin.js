/* Copyright Contributors to the Open Cluster Management project */

module.exports = ({ types }) => ({
  visitor: {
    MemberExpression(path) {
      const { object, property } = path.node

      if (
        types.isMetaProperty(object) &&
        types.isIdentifier(object.meta, { name: 'import' }) &&
        types.isIdentifier(object.property, { name: 'meta' }) &&
        types.isIdentifier(property, { name: 'hot' })
      ) {
        path.replaceWith(types.booleanLiteral(false))
      }
    },
  },
})
