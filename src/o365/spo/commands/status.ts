import auth from '../SpoAuth';
import config from '../../../config';
import commands from '../commands';
import Command, {
  CommandError
} from '../../../Command';
import Utils from '../../../Utils';
import { AuthType } from '../../../Auth';

const vorpal: Vorpal = require('../../../vorpal-init');

class SpoStatusCommand extends Command {
  public get name(): string {
    return commands.STATUS;
  }

  public get description(): string {
    return 'Shows SharePoint Online site login status';
  }

  public commandAction(cmd: CommandInstance, args: {}, cb: (err?: any) => void): void {
    auth
      .restoreAuth()
      .then((): void => {
        if (auth.site.connected) {
          if (this.debug) {
            cmd.log({
              connectedAs: Utils.getUserNameFromAccessToken(auth.service.accessToken),
              isTenantAdmin: auth.site.isTenantAdminSite(),
              authType: AuthType[auth.service.authType],
              aadResource: auth.service.resource,
              accessToken: auth.service.accessToken,
              refreshToken: auth.service.refreshToken,
              expiresAt: auth.service.expiresOn
            });
          }
          else {
            cmd.log({
              connectedTo: auth.site.url,
              connectedAs: Utils.getUserNameFromAccessToken(auth.service.accessToken)
            });
          }
        }
        else {
          if (this.verbose) {
            cmd.log('Logged out from SharePoint Online');
          }
          else {
            cmd.log('Logged out');
          }
        }
        cb();
      }, (error: any): void => {
        cb(new CommandError(error));
      });
  }

  public commandHelp(args: any, log: (help: string) => void): void {
    const chalk = vorpal.chalk;
    log(vorpal.find(commands.STATUS).helpInformation());
    log(
      `  Remarks:

    If you are logged in to SharePoint Online, the ${chalk.blue(commands.STATUS)} command
    will show you information about the site to which you are logged in, the
    currently stored refresh and access token and the expiration date and time
    of the access token.

  Examples:
  
    Show the information about the current login to SharePoint Online
      ${chalk.grey(config.delimiter)} ${commands.STATUS}
`);
  }
}

module.exports = new SpoStatusCommand();