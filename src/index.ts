import {
  ExtensionContext,
  ISource,
  SourceType,
  CompleteOption,
  sources
} from "coc.nvim";
import simplegit from "simple-git/promise";
import commitsParser from "conventional-commits-parser";

export async function activate(context: ExtensionContext): Promise<void> {
  let source: ISource = {
    name: "conv-git",
    enable: true,
    filetypes: ["gitcommit"],
    priority: 99,
    sourceType: SourceType.Service,
    doComplete: async function(opt: CompleteOption) {
      if (!opt.input) return;
      const { input } = opt;
      const matches = await getHistory(input);

      return {
        items: matches.map(m => ({
          word: m,
          filterText: m
        }))
      };
    }
  };

  const { subscriptions } = context;
  subscriptions.push(sources.addSource(source));
}

export async function getHistory(input?: string): Promise<Match[]> {
  const git = simplegit();
  const logs = await git.log();

  if (!input) {
    return logs.all
      .map(l => l.message)
      .map(m => commitsParser.sync(m).scope)
      .filter(m => m != null);
  }

  return logs.all
    .filter(l => l.message.includes(input))
    .map(l => l.message)
    .map(m => commitsParser.sync(m).scope)
    .filter(m => m != null);
}

type Match = string;
