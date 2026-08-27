export const DESCRIPTION_FIELD: string = 'description';
export const KEYWORD_PATTERN = /^gsusa-vtk-redesign:keyword\/[a-z0-9]\/(.+)/i;
export const NAME_FIELD: string = 'name';

/**
 * TextField is an enum representing the type of text field.
 */
export enum TextField {

  /**
   * HTML text field type.
   */
  HTML = 'html',

  /**
   * Plain text field type.
   */
  PLAIN_TEXT = 'plaintext',
}
