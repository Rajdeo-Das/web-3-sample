const anchor = require('@project-serum/anchor')

const main = async () => {
  console.log('Starting test ...')

  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const program = anchor.workspace.Gifportal

  const baseAccount = anchor.web3.Keypair.generate()
  const tx = await program.rpc.startStuffOff({
    accounts: {
      baseAccount: baseAccount.publicKey,
      user: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    },
    signers: [baseAccount]
  })
  console.log('You transaction signature', tx)
  let account = await program.account.baseAccount.fetch(baseAccount.publicKey)
  console.log('GIF count', account.totalGifs.toString());

  await program.rpc.addGif(
    'https://media4.giphy.com/media/FNhXqYTAbg3kOs1a2m/giphy.gif?cid=790b7611ebf837c91c0af8c1ccca653bb5f3d044aba7afbd&rid=giphy.gif&ct=g',
    {
      accounts: {
        baseAccount: baseAccount.publicKey,
        user: provider.wallet.publicKey,
      },
    }
  );

account = await program.account.baseAccount.fetch(baseAccount.publicKey);
console.log('GIF count', account.totalGifs.toString());
console.log('GIF List', account.gifList);
}
const runMain = async () => {
  try {
    await main();
    process.exit(0);

  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}
runMain();