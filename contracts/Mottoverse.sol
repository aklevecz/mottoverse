//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

contract Mottoverse is ERC1155, EIP712 {
    struct Locale {
        bytes32 lat;
        bytes32 lng;
    }

    Locale _blankLocale = Locale(0, 0);

    uint256 public constant GOLD = 0;
    uint256 public constant A = 1;
    uint256 public constant B = 2;
    uint256 public constant C = 3;
    uint256 public constant D = 4;
    uint256 public constant E = 5;
    uint256 public constant F = 6;
    uint256 public constant G = 7;
    uint256 public constant H = 8;
    uint256 public constant I = 9;
    uint256 public constant J = 10;
    uint256 public constant K = 11;
    uint256 public constant L = 12;
    uint256 public constant M = 13;
    uint256 public constant N = 14;
    uint256 public constant O = 15;
    uint256 public constant P = 16;
    uint256 public constant Q = 17;
    uint256 public constant R = 18;
    uint256 public constant S = 19;
    uint256 public constant T = 20;
    uint256 public constant U = 21;
    uint256 public constant V = 22;
    uint256 public constant W = 23;
    uint256 public constant X = 24;
    uint256 public constant Y = 25;
    uint256 public constant Z = 26;
    uint256 public constant NFT_START = 27;

    struct SignedLetterData {
        uint256[] letters;
        uint256[] amounts;
    }

    // Make public?
    uint256 private _tokenIds = NFT_START;

    uint256 public wordIds = NFT_START;
    uint256 public mottoIds = NFT_START + 1;

    uint256[] public words;
    uint256[] public mottos;
    uint256[] public placedMottos;

    // Maybe use bytes
    mapping(uint256 => bytes32) public tokenIdToWordHash;
    mapping(uint256 => bytes32) public tokenIdToMottoHash;

    // Probably bad -- could be hashed
    mapping(bytes32 => uint256) public wordToTokenId;
    mapping(bytes32 => uint256) public mottoToTokenId;

    mapping(uint256 => address) public tokenIdToOwner;

    // Motto to Locales
    mapping(uint256 => Locale) public Locales;

    event WordCreated(address indexed creator, uint256 tokenId, uint8[] word);
    event MottoCreated(
        address indexed creator,
        uint256 tokenId,
        uint256[] motto
    );
    event MottoPlaced(address indexed creator, uint256 tokenId, Locale locale);
    event MottoReleased(address indexed creator, uint256 tokenId);

    address public owner;

    constructor()
        ERC1155("https://cdn.mttvrs.com/metadata/{id}.json")
        EIP712("frogass", "1.0")
    {
        owner = msg.sender;
        _mint(msg.sender, GOLD, 10**18, "");
        _mint(address(this), GOLD, 10**18, "");
        _mint(address(this), A, 10**18, "");
        _mint(address(this), B, 10**18, "");
        _mint(address(this), C, 10**18, "");
        _mint(address(this), D, 10**18, "");
        _mint(address(this), E, 10**18, "");
        _mint(address(this), F, 10**18, "");
        _mint(address(this), G, 10**18, "");
        _mint(address(this), H, 10**18, "");
        _mint(address(this), I, 10**18, "");
        _mint(address(this), J, 10**18, "");
        _mint(address(this), K, 10**18, "");
        _mint(address(this), L, 10**18, "");
        _mint(address(this), M, 10**18, "");
        _mint(address(this), N, 10**18, "");
        _mint(address(this), O, 10**18, "");
        _mint(address(this), P, 10**18, "");
        _mint(address(this), Q, 10**18, "");
        _mint(address(this), R, 10**18, "");
        _mint(address(this), S, 10**18, "");
        _mint(address(this), T, 10**18, "");
        _mint(address(this), U, 10**18, "");
        _mint(address(this), V, 10**18, "");
        _mint(address(this), W, 10**18, "");
        _mint(address(this), X, 10**18, "");
        _mint(address(this), Y, 10**18, "");
        _mint(address(this), Z, 10**18, "");
    }

    function ownerOf(uint256 _tokenId) public view returns (address) {
        return tokenIdToOwner[_tokenId];
    }

    function _hash(SignedLetterData calldata letterData)
        internal
        view
        returns (bytes32)
    {
        bytes32 digest = _hashTypedDataV4(
            keccak256(
                abi.encode(
                    keccak256(
                        "SignedLetterData(uint256[] letters,uint256[] amounts)"
                    ),
                    keccak256(abi.encodePacked(letterData.letters)),
                    keccak256(abi.encodePacked(letterData.amounts))
                )
            )
        );
        return digest;
    }

    function _validateSignature(bytes32 digest, bytes memory signature)
        internal
        view
        returns (bool)
    {
        address signer = ECDSA.recover(digest, signature);
        return (owner == signer);
    }

    function getLetterBatch(
        SignedLetterData calldata letterData,
        bytes calldata signature
    ) public {
        require(
            _validateSignature(_hash(letterData), signature),
            "Invalid signature"
        );
        _safeTransferFrom(msg.sender, address(this), GOLD, 100, "");
        uint8 i;
        for (i = 0; i < letterData.letters.length; i++) {
            require(
                letterData.letters[i] > 0 && letterData.letters[i] < NFT_START,
                "This is not a letter"
            );
        }
        _safeBatchTransferFrom(
            address(this),
            msg.sender,
            letterData.letters,
            letterData.amounts,
            ""
        );
    }

    function buyGold() public payable {
        require(msg.value >= 10**16, "must be .01 matic");
        _safeTransferFrom(address(this), msg.sender, GOLD, 100, "");
    }

    function getLetterBalances() public view returns (uint256[26] memory) {
        uint256[26] memory _letterBalances;
        uint8 _letter;
        for (_letter = 0; _letter < NFT_START - 1; _letter++) {
            _letterBalances[_letter] = balanceOf(msg.sender, _letter + 1);
        }
        return _letterBalances;
    }

    function createWord(
        uint256[] memory _letters,
        uint256[] memory _amounts,
        uint8[] memory _word
    ) public {
        bytes32 _wordHash = keccak256(abi.encodePacked(_word));
        require(wordToTokenId[_wordHash] == 0, "Word exists");
        uint8 i;
        for (i = 0; i < _letters.length; i++) {
            uint256 _letter = _letters[i];
            uint256 _amount = _amounts[i];
            uint8 j;
            for (j = 0; j < _word.length; j++) {
                if (_letter == _word[j]) {
                    _amount--;
                }
            }
            require(_amount == 0, "Letters and word do not match");
        }
        _safeBatchTransferFrom(
            msg.sender,
            address(this),
            _letters,
            _amounts,
            ""
        );
        uint256 _currentWordId = wordIds;
        _mint(msg.sender, _currentWordId, 1, "");
        wordToTokenId[_wordHash] = _currentWordId;
        tokenIdToWordHash[_currentWordId] = _wordHash;
        words.push(_currentWordId);
        tokenIdToOwner[_currentWordId] = msg.sender;
        emit WordCreated(msg.sender, _currentWordId, _word);
        wordIds = wordIds + 2;
    }

    // Needs to transfer/burn words -- no it doesn't
    function createMotto(uint256[] memory _motto) public {
        require(_motto.length < 20, "Motto too long");
        bytes32 _mottoHash = keccak256(abi.encodePacked(_motto));
        require(mottoToTokenId[_mottoHash] == 0, "Motto is taken");

        uint256 i;
        for (i = 0; i < _motto.length; i++) {
            uint256 _word = _motto[i];
            require(
                tokenIdToWordHash[_word].length != 0,
                "This word does not exist"
            );

            address _wordOwner = ownerOf(_word);
            if (_wordOwner != msg.sender) {
                // is not the owner of the word
                _safeTransferFrom(msg.sender, _wordOwner, GOLD, 100, "");
            } else {
                // is the owner of the word
            }
        }

        uint256 _currentTokenId = mottoIds;
        _mint(msg.sender, _currentTokenId, 1, "");
        mottoToTokenId[_mottoHash] = _currentTokenId;
        mottos.push(_currentTokenId);
        emit MottoCreated(msg.sender, _currentTokenId, _motto);
        mottoIds = mottoIds + 2;
    }

    function placeMotto(
        uint256 _tokenId,
        bytes32 _lat,
        bytes32 _lng
    ) public {
        // Could also be not an NFT
        // To do: other validation about the token
        // Should you only be able to put a Motto in one place? probably...
        require(
            Locales[_tokenId].lat == 0,
            "This motto has already been placed"
        );
        require(balanceOf(msg.sender, _tokenId) == 1, "Not owner");
        require(
            Locales[_tokenId].lat == 0 && Locales[_tokenId].lng == 0,
            "Motto is placed"
        );
        Locale memory _locale = Locale(_lat, _lng);
        Locales[_tokenId] = _locale;
        placedMottos.push(_tokenId);
        emit MottoPlaced(msg.sender, _tokenId, _locale);
    }

    function releaseMotto(uint256 _tokenId) public {
        require(balanceOf(msg.sender, _tokenId) == 1, "Not owner");
        Locales[_tokenId] = _blankLocale;
        uint256 i;
        for (i = 0; i < placedMottos.length; i++) {
            if (placedMottos[i] == _tokenId) {
                placedMottos[i] = placedMottos[placedMottos.length - 1];
                placedMottos.pop();
            }
        }
        emit MottoReleased(msg.sender, _tokenId);
    }

    function getPlacedMottos() public view returns (uint256[] memory) {
        return placedMottos;
    }

    function onERC1155Received(
        address _a,
        address _b,
        uint256 _tokenId,
        uint256,
        bytes memory
    ) public virtual returns (bytes4) {
        // if (_tokenId > 0 && _tokenId < NFT_START) {
        //       uint256[25] memory _letterBalance = letterBalance[msg.sender];
        // _letterBalance[_randomLetter] = _letterBalance[_randomLetter] + 1;
        // letterBalance[msg.sender] = _letterBalance;
        // return _randomLetter;
        // }
        // console.log(_a, _b, _tokenId);
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address _a,
        address _b,
        uint256[] memory,
        uint256[] memory,
        bytes memory
    ) public virtual returns (bytes4) {
        // console.log(_a, _b);

        return this.onERC1155BatchReceived.selector;
    }

    // function _beforeTokenTransfer(
    //   address operator,
    //   address from,
    //   address to,
    //   uint256[] memory,
    //   uint256[] memory,
    //   bytes memory
    // ) internal override {
    //   console.log(from, to);
    // }
}
