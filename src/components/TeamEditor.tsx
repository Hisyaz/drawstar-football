import React from 'react';
import { TeamEditorContainer } from './editor/TeamEditorContainer';

type TeamEditorProps = React.ComponentProps<typeof TeamEditorContainer>;

export const TeamEditor: React.FC<TeamEditorProps> = (props) => {
  return <TeamEditorContainer {...props} />;
};
